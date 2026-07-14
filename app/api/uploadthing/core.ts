import { auth } from "@/auth";
import { validateCategoryImageMetadata } from "@/src/lib/images/category-image-validation";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

async function requireAdmin() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    throw new UploadThingError("Unauthorized");
  }

  return session;
}

export const uploadRouter = {
  productImageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 5,
    },
  })
    .middleware(async () => {
      const session = await requireAdmin();

      return {
        uploadedBy: session.user.id,
      };
    })
    .onUploadComplete(({ file, metadata }) => ({
      uploadedBy: metadata.uploadedBy,
      url: file.url,
      name: file.name,
      key: file.key,
    })),
  categoryImageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ files }) => {
      const session = await requireAdmin();
      const file = files[0];
      const validationError = file
        ? validateCategoryImageMetadata(file)
        : "Choose an image to upload.";

      if (files.length !== 1 || validationError) {
        throw new UploadThingError(
          validationError ?? "Choose exactly one image.",
        );
      }

      return {
        uploadedBy: session.user.id,
      };
    })
    .onUploadComplete(({ file, metadata }) => ({
      uploadedBy: metadata.uploadedBy,
      url: file.ufsUrl,
      name: file.name,
      key: file.key,
    })),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
