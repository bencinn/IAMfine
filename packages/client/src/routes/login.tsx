import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";

import z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

const formSchema = z.object({
  username: z.string(),
  password: z.string(),
});

function RouteComponent() {
  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    validators: {
      onSubmit: formSchema,
    },
  });

  return (
    <div>
      <Toaster />
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>IAM Login</CardTitle>
          <CardDescription>Login to IAMfine</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="login" method="POST" action="http://oidc.chimamema.me/login">
            <FieldGroup>
              <form.Field
                name="username"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Login</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="username"
                        autoComplete="off"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />
              <form.Field
                name="password"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="password"
                        autoComplete="off"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button type="submit" form="login">
              Submit
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
}
