import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        await connectDB();

        const customer = await Customer.findOne({ email: credentials.email.toLowerCase() });

        if (!customer) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(credentials.password, customer.password);

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: customer._id.toString(),
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          role: customer.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as typeof user & { role?: string; phone?: string; address?: string };
        token.id = user.id;
        token.role = u.role;
        token.phone = u.phone;
        token.address = u.address;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const su = session.user as typeof session.user & { id?: string; role?: string; phone?: string; address?: string };
        su.id = token.id as string;
        su.role = token.role as string;
        su.phone = token.phone as string;
        su.address = token.address as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };