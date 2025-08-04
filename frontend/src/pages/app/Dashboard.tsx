import { LandingWrapper } from "../../hoc";

const Dashboard = () => {
  return (
    <div className="w-full h-[70vh] flex flex-col items-center justify-center text-center bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl shadow-lg p-10">
      <h2 className="text-4xl font-bold text-textColor mb-4">Dashboard</h2>
      <p className="text-lg text-textColor/80">
        The Unifeed dashboard is coming soon. Here you’ll be able to view
        insights, track user feedback trends, and make data-informed decisions.
      </p>
    </div>
  );
};

const WrappedDashboard = LandingWrapper(Dashboard);
export default WrappedDashboard;
