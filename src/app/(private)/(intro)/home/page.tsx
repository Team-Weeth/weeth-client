import { LeftContainer, MainContainer, RightContainer, Banner } from '@/components/home';
import { Header } from '@/components/layout';

export default function HomePage() {
  return (
    <div>
      <Banner />
      <Header />
      <div className="flex w-full gap-8 px-16">
        <div className="flex flex-col gap-300">
          <LeftContainer />
        </div>
        <div className="flex flex-col gap-300">
          <MainContainer />
        </div>
        <div className="flex flex-col gap-300">
          <RightContainer />
        </div>
      </div>
    </div>
  );
}
