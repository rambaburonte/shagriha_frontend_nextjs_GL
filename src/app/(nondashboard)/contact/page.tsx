"use client";

import { type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("fullName") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const subject = encodeURIComponent(`ShaGriha contact request from ${fullName}`);
    const body = encodeURIComponent(
      [`Full name: ${fullName}`, `Phone: ${phone}`, `Email: ${email}`, "", "Message:", description || "No description provided."].join("\n")
    );

    window.location.href = `mailto:shashanksub76@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-background px-4 py-10 sm:py-16">
      <section className="w-full max-w-md rounded-lg border border-border bg-background p-8 shadow-sm">
        <header className="mb-7">
          <h1 className="text-2xl font-bold">
            SHA<span className="font-light text-secondary-500">GRIHA</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            <span className="font-bold text-foreground">Contact us</span>{" "}
            and tell us how we can help.
          </p>
        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="full-name">Full name *</Label>
            <Input
              id="full-name"
              name="fullName"
              autoComplete="name"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={5}
              placeholder="How can we help?"
            />
          </div>

          <Button type="submit" className="mt-2 w-full">
            Continue to email
          </Button>
        </form>
      </section>
    </main>
  );
}
