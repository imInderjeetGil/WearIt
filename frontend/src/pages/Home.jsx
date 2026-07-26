import Container from "../components/layout/Container";
import Hero from "../components/home/Hero";
import NewArrivals from "../components/home/NewArrivals";

export default function Home() {
  return (
    <>
      <Hero />

      <Container>
        <NewArrivals />

      </Container>
    </>
  );
}