import { internalHttpClient } from "@/lib/http";
import { API_ROUTES } from "@/lib/apiRoutes";
import type { StatusResponseDto } from "@/app/api/library/status/dtos/status.dto";

type StatusApiResponse = {
  data: StatusResponseDto;
};

export async function fetchLibraryStatus(): Promise<StatusResponseDto> {
  const response = await internalHttpClient.get<StatusApiResponse>(
    API_ROUTES.library.status,
  );
  return response.data.data;
}
