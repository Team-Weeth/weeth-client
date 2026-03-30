import dynamic from 'next/dynamic';

const CreateClubForm = dynamic(() =>
  import('@/components/auth/hub').then((mod) => mod.CreateClubForm),
);

export default function CreateClubPage() {
  return <CreateClubForm />;
}
