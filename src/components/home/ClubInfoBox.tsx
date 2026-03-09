import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui';
import { ClubInfo, MyActivity } from '@/components/home';

export function ClubInfoBox() {
  return (
    <div className="bg-container-neutral flex w-full flex-col rounded-lg px-450 pt-[22px] pb-450">
      <Tabs defaultValue="동아리 정보" className="w-full">
        <TabsList>
          <TabsTrigger value="동아리 정보">동아리 정보</TabsTrigger>
          <TabsTrigger value="나의 활동">나의 활동</TabsTrigger>
        </TabsList>
        <TabsContent value="동아리 정보">
          <ClubInfo />
        </TabsContent>
        <TabsContent value="나의 활동">
          <MyActivity />
        </TabsContent>
      </Tabs>
    </div>
  );
}
