"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
  id: z.string().min(1, { message: "User ID is required." }),
  name: z.string().min(1, { message: "Name is required." }),
  role: z.enum(["teacher", "student"], {
    required_error: "You need to select a role.",
  }),
});

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      name: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await register(values.id, values.name, values.role);
      toast({
        title: "Registration Successful",
        description: "You can now sign in with your new account.",
      });
      router.push("/");
    } catch (error) {
      const e = error as Error;
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: e.message,
      });
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
            <div className="flex flex-col items-center mb-4">
                <UserPlus className="h-12 w-12 text-primary mb-2" />
                <CardTitle className="text-center text-2xl font-headline">
                Create an Account
                </CardTitle>
            </div>
        </CardHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
                <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>User ID</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., T01T001 or S01" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Krithi or Alice" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>I am a...</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="teacher" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                Teacher
                                </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="student" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                Student
                                </FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                    "Registering..."
                ) : (
                    <>
                    <UserPlus className="mr-2 h-4 w-4" /> Register
                    </>
                )}
                </Button>
                <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Button variant="link" asChild>
                        <Link href="/">Sign In</Link>
                    </Button>
                </p>
            </CardFooter>
            </form>
        </Form>
        </Card>
    </main>
  );
}
