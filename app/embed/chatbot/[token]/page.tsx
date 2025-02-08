import ChatView from "@/components/console/chatbot/chat-view";
import { prisma } from "@/lib/utils/db";

export const dynamic = "force-dynamic";

export default async function ChatbotEmbed(
  props: {
    params: Promise<{ token: string }>;
  }
) {
  const params = await props.params;
  const { token } = params;

  // Fetch the session token to get the chatbot and owner information
  const sessionToken = await prisma.chatBotUserSession.findUnique({
    where: { id: token },
    include: { chatbot: true },
  });

  if (!sessionToken) {
    return <div>Invalid token</div>;
  }

  // Fetch the secret key for the chatbot's owner
  const secretKey = await prisma.secretKey.findFirst({
    where: { ownerId: sessionToken.chatbot.ownerId },
    select: { key: true },
  });

  if (!secretKey) {
    return <div>Error: Unable to authenticate</div>;
  }

  return <ChatView token={token} secretKey={secretKey.key} isEmbed />;
}

// import ChatView from "@/components/console/chatbot/chat-view";

// export default async function ChatbotEmbed(
//   props: {
//     params: Promise<{ token: string }>;
//   }
// ) {
//   const params = await props.params;

//   const {
//     token
//   } = params;

//   return <ChatView token={token} isEmbed />;
// }
