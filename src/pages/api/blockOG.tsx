import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

type Props = {
  role: string;
  content: string;
};

export default async function handler(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const param = searchParams.get("content");

  if (param) {
    const content = JSON.parse(param) as Props[];
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
          }}
        >
          <div tw="flex flex-col w-full">
            {content.map((item, index) => (
              <div
                key={index}
                tw={`w-3/4 mx-auto my-2 p-4 rounded-lg text-white font-semibold flex flex-col ${
                  item.role == "system"
                    ? "bg-red-500"
                    : item.role == "user"
                    ? "bg-blue-500"
                    : "bg-green-500"
                }`}
              >
                <div tw="mb-2">{item.role}</div>
                <div tw="w-full p-2 border border-black/20 rounded-lg">
                  {item.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } else {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
          }}
        ></div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
