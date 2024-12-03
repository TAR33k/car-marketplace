export interface MyPagedList<T> {
  data: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface MyPagedRequest {
  pageNumber: number;
  pageSize: number;
}
