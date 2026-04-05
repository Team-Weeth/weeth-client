export interface Cardinal {
  id: number;
  cardinalNumber: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  modifiedAt: string;
}

export interface CreateCardinalBody {
  cardinalNumber: number;
  inProgress: boolean;
}
