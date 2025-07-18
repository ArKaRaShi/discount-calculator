export interface BaseResponse<TData> {
	message: string;
	data: TData | null;
	issues?: [{ [key: string]: string | string[] }];
}
