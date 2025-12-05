export const successResponse = (message: string, data?: any) => {
  const response: { success: true; message: string; data?: any } = {
    success: true,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  return response;
};

export const errorResponse = (message: string, errors: any = null) => ({
  success: false,
  message,
  errors: errors || message,
});
