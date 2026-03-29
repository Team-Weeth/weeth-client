'use client';

import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui';
import { ClubActions } from './ClubActions';
import { useHomeQuery } from '@/hooks/home/useHomeQuery';
import { ClubProfileHeader } from './ClubProfileHeader';
import { UserProfileHeader } from './UserProfileHeader';

export function ClubInfoBox() {
  const { data } = useHomeQuery();

  return (
    <div className="bg-container-neutral flex w-full flex-col rounded-lg px-450 pt-[22px] pb-450">
      <Tabs defaultValue="동아리 정보" className="w-full">
        <TabsList>
          <TabsTrigger value="동아리 정보">동아리 정보</TabsTrigger>
          <TabsTrigger value="나의 활동">나의 활동</TabsTrigger>
        </TabsList>
        <TabsContent value="동아리 정보">
          <ClubProfileHeader />
        </TabsContent>
        <TabsContent value="나의 활동">
          <UserProfileHeader />
        </TabsContent>
      </Tabs>
      <ClubActions
        memberCount={data?.club.memberCount}
        clubName={data?.club.name}
        clubCode={data?.club.code}
      />
    </div>
  );
}
