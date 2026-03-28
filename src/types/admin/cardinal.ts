export interface Cardinal {
  id: number;
  cardinalNumber: number;
  year: number;
  semester: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  modifiedAt: string;
}

export interface CreateCardinalBody {
  cardinalNumber: number;
  year: number;
  semester: number;
  inProgress: boolean;
}
