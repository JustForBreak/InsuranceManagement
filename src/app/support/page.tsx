// src/app/support/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Phone, Mail, MessageCircle, Clock, CheckCircle, LifeBuoy, Headphones } from "lucide-react";

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app: send to backend/email
    console.log("Support request:", formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <LifeBuoy className="w-10 h-10 text-blue-600" />
            Get Help
          </h1>
          <p className="text-xl text-muted-foreground mt-3">
            We're here 24/7 to help you with anything
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-8 hover:shadow-lg transition-shadow cursor-pointer">
            <Phone className="w-12 h-12 mx-auto text-green-600 mb-4" />
            <h3 className="text-xl font-bold">Call Us</h3>
            <p className="text-2xl font-bold text-blue-600 mt-2">1-800-INSURE</p>
            <Badge variant="secondary" className="mt-3">24/7 Available</Badge>
          </Card>

          <Card className="text-center p-8 hover:shadow-lg transition-shadow cursor-pointer">
            <MessageCircle className="w-12 h-12 mx-auto text-purple-600 mb-4" />
            <h3 className="text-xl font-bold">Live Chat</h3>
            <p className="text-lg mt-2">Average response: <strong>30 seconds</strong></p>
            <Button className="mt-4">Start Chat</Button>
          </Card>

          <Card className="text-center p-8 hover:shadow-lg transition-shadow cursor-pointer">
            <Mail className="w-12 h-12 mx-auto text-orange-600 mb-4" />
            <h3 className="text-xl font-bold">Email Us</h3>
            <p className="text-lg mt-2">support@yourinsurance.com</p>
            <Badge variant="outline" className="mt-3">Reply within 1 hour</Badge>
          </Card>
        </div>

        {/* Tabs: FAQ + Contact Form */}
        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contact">Contact Form</TabsTrigger>
            <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
          </TabsList>

          {/* Contact Form */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
                <CardDescription>We typically reply within 1 hour</CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
                    <h3 className="text-2xl font-bold">Message Sent!</h3>
                    <p className="text-muted-foreground mt-2">We'll get back to you soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label>Your Name</Label>
                        <Input
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Email Address</Label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Subject</Label>
                      <Input
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>How can we help?</Label>
                      <Textarea
                        required
                        rows={6}
                        placeholder="Describe your issue or question..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full">
                      <Headphones className="w-5 h-5 mr-2" />
                      Send Message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ */}
          <TabsContent value="faq">
            <div className="space-y-6">
              {[
                { q: "How do I file a claim?", a: "Go to My Claims → File New Claim. Upload photos and we'll process it instantly." },
                { q: "Can I change my coverage?", a: "Yes! Go to My Policies → select policy → Edit Coverage." },
                { q: "Where’s my ID card?", a: "Documents → open your policy → download Digital ID Card." },
                { q: "How do I cancel a policy?", a: "My Policies → click Cancel → confirm. Refund processed in 3–5 days." },
                { q: "When is my payment due?", a: "Check My Policies → see Premium Due Date. We send reminders 7 days before." },
              ].map((item, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                      {item.q}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Emergency */}
        <Card className="bg-red-50 border-red-200">
          <CardContent className="py-8 text-center">
            <Clock className="w-12 h-12 mx-auto text-red-600 mb-4" />
            <h3 className="text-2xl font-bold text-red-800">Emergency?</h3>
            <p className="text-lg mt-2">Call 911 or our 24/7 emergency line:</p>
            <p className="text-3xl font-bold text-red-600 mt-4">1-800-911-HELP</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}