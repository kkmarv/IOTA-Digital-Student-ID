export async function fetchApi(
  method: "GET" | "POST" | "PUT",
  url: string,
  body?: string
): Promise<Response> {
  let response: Response;

  try {
    response = await fetch(url, {
      method: method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: body,
    });
  } catch (error) {
    console.log("An error occurred: ", error.message);
  }

  handleErrors(response);
  return response;
}

async function handleErrors(response?: Response) {
  if (response?.ok) return;
  const message = await response.json();
  console.log(message);
}
