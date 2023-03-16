import { type NextPage } from "next";
import { Nav } from "~/components/NavBar";

const Home: NextPage = () => {
  return (
    <main className="w-screen">
      <div className="p-4">
        <Nav />
      </div>
    </main>
  );
};

export default Home;
