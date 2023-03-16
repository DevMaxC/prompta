import { type NextPage } from "next";
import { Nav } from "~/components/NavBar";

const Home: NextPage = () => {
  return (
    <main className="min-h-screen bg-slate-100">
      <div>
        <Nav />
      </div>
    </main>
  );
};

export default Home;
