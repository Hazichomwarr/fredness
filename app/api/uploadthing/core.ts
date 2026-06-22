import { auth } from "@/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const uploadRouter = {
  productImageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 5,
    },
  })
    .middleware(async () => {
      const session = await auth();

      if (session?.user?.role !== "ADMIN") {
        throw new UploadThingError("Unauthorized");
      }

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
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
