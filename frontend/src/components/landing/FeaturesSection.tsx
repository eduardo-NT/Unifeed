import {
  HiOutlineUserGroup,
  HiOutlineAnnotation,
  HiOutlineChartPie,
  HiOutlineLightBulb,
  HiOutlineTag,
  HiOutlineDatabase,
} from "react-icons/hi";

const features = [
  {
    title: "Unified Feedback Hub",
    description:
      "Aggregate feedback from Twitter, email, reviews, and more — all in one place.",
    icon: HiOutlineUserGroup,
  },
  {
    title: "Smart Categorization",
    description:
      "Automatically label feedback as bugs, feature requests, or usability issues using NLP.",
    icon: HiOutlineAnnotation,
  },
  {
    title: "Trend Analytics",
    description:
      "Visualize trending topics, recurring pain points, and emerging concerns over time.",
    icon: HiOutlineChartPie,
  },
  {
    title: "Actionable Insights",
    description:
      "Get intelligent suggestions on what to prioritize based on frequency and sentiment.",
    icon: HiOutlineLightBulb,
  },
  {
    title: "Source Breakdown",
    description:
      "See where feedback comes from — Twitter, email, in-app, or public reviews — and their impact.",
    icon: HiOutlineTag,
  },
  {
    title: "Data Export & Reports",
    description:
      "Download summaries, insights, and visual reports to share with your team or stakeholders.",
    icon: HiOutlineDatabase,
  },
];

const FeaturesSection = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-8">
      <span className="w-full sm:w-2/3 flex flex-col items-center justify-center">
        <h1 className="text-xl uppercase opacity-75 font-extrabold text-center text-textColor">
          Key Features
        </h1>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-center text-textColor">
          Feedback Intelligence. Reimagined.
        </h1>
        <p className="w-full sm:w-2/3 mt-3 text-lg sm:text-xl text-center opacity-75">
          Unifeed helps you turn scattered feedback into strategic clarity — no
          spreadsheets, no chaos.
        </p>
      </span>

      {/* Features Grid */}
      <div className="w-11/12 max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 gap-10">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-xl hover:shadow-textColor/40 transition-all duration-300 hover:scale-[1.03] flex flex-col items-center text-center"
            >
              <div className="bg-textColor/20 p-4 rounded-full mb-4">
                <Icon className="text-4xl text-textColor" />
              </div>
              <h3 className="text-2xl font-semibold text-textColor mb-2 tracking-wide">
                {feature.title}
              </h3>
              <p className="text-base text-textColor/90 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturesSection;
