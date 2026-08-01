import Container from "../../../shared/components/layout/Container";
import Hero from "../components/Hero";
import NewArrivals from "../components/NewArrivals";

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
