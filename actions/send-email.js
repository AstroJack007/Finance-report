import { Resend } from "resend";

export async function sendEmail({ to, subject, react }) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const data = await resend.emails.send({
      from: "Wealth <onboarding@resend.dev>",
        to,
        subject,
        react: react,
    });
   
    return {
      success: true,
      data: data,
    };
  } catch (err) {
    console.error("Error in sendEmail:", err);
    return {
      success: false,
      error: err.message ,
    };
  }
}
