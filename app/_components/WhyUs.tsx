// components/WhyUs.tsx

export default function WhyUs() {
  const features = [
    {
      title: "Fresh & Authentic Products",
      description:
        "We source high-quality African and Caribbean foods you can trust.",
      icon: "🥬",
    },
    {
      title: "Wholesale & Retail Options",
      description:
        "Whether you're buying for your home or your business, we've got you covered.",
      icon: "📦",
    },
    {
      title: "Bulk Discounts Available",
      description:
        "Save more when you buy in bulk — perfect for families and resellers.",
      icon: "💰",
    },
    {
      title: "Fast Local Pickup",
      description: "Convenient pickup in Orange, NJ with quick service.",
      icon: "🚚",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose Us</h2>
          <p className="text-gray-600 mt-3">
            Trusted by the community for quality, price, and convenience
          </p>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition"
            >
              <div className="text-3xl">{feature.icon}</div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>

              <p className="mt-2 text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
