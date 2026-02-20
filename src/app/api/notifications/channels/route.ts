import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const slackConfigSchema = z.object({
  webhook_url: z
    .string()
    .url()
    .max(2048)
    .refine((url) => url.startsWith("https://hooks.slack.com/"), {
      message: "Must be a valid Slack webhook URL",
    }),
});

const webhookConfigSchema = z.object({
  url: z.string().url().max(2048),
  secret: z.string().max(256).nullable().optional(),
  headers: z.record(z.string().max(256), z.string().max(1024)).nullable().optional(),
});

const smsConfigSchema = z.object({
  phone_number: z
    .string()
    .trim()
    .min(7)
    .max(20)
    .regex(/^\+?[0-9\s-]+$/, "Invalid phone number format"),
  country_code: z
    .string()
    .trim()
    .min(1)
    .max(5)
    .regex(/^\+?[0-9]+$/, "Invalid country code"),
});

const createChannelSchema = z.object({
  name: z.string().trim().min(1).max(100),
  type: z.enum(["slack", "webhook", "sms"]),
  config: z.unknown(),
  status_page_id: z.string().uuid().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createChannelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { name, type, config, status_page_id } = parsed.data;

  // Validate config based on channel type
  let validatedConfig: Record<string, unknown>;
  switch (type) {
    case "slack": {
      const slackResult = slackConfigSchema.safeParse(config);
      if (!slackResult.success) {
        return NextResponse.json(
          { error: slackResult.error.issues[0].message },
          { status: 400 },
        );
      }
      validatedConfig = slackResult.data;
      break;
    }
    case "webhook": {
      const webhookResult = webhookConfigSchema.safeParse(config);
      if (!webhookResult.success) {
        return NextResponse.json(
          { error: webhookResult.error.issues[0].message },
          { status: 400 },
        );
      }
      validatedConfig = {
        url: webhookResult.data.url,
        secret: webhookResult.data.secret ?? null,
        headers: webhookResult.data.headers ?? null,
      };
      break;
    }
    case "sms": {
      const smsResult = smsConfigSchema.safeParse(config);
      if (!smsResult.success) {
        return NextResponse.json(
          { error: smsResult.error.issues[0].message },
          { status: 400 },
        );
      }
      validatedConfig = smsResult.data;
      break;
    }
    default:
      return NextResponse.json(
        { error: "Invalid channel type" },
        { status: 400 },
      );
  }

  // If linking to a status page, verify ownership
  if (status_page_id) {
    const { data: page } = await supabase
      .from("status_pages")
      .select("id")
      .eq("id", status_page_id)
      .eq("user_id", user.id)
      .single();

    if (!page) {
      return NextResponse.json(
        { error: "Status page not found" },
        { status: 404 },
      );
    }
  }

  const { data, error } = await supabase
    .from("notification_channels")
    .insert({
      user_id: user.id,
      name,
      type,
      config: validatedConfig,
      status_page_id: status_page_id ?? null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
