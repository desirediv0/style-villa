import { Music2, PartyPopper, Building2, Church, School, Truck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/ui/PageHero";

export const metadata = {
    title: "Industries We Serve | stylevilla",
    description: "Professional fashion and lifestyle solutions tailored for events, personal shopping, and corporate gifting across India.",
};

const industries = [
    {
        icon: PartyPopper,
        name: "Weddings & Celebrations",
        description: "Make every celebration memorable with stunning fashion for every occasion.",
        features: ["Ethnic Wear", "Party Collection", "Festive Accessories"],
        link: "/products",
    },
    {
        icon: Music2,
        name: "Party & Nightlife",
        description: "Trendy and bold fashion picks for nights out and social events.",
        features: ["Western Wear", "Statement Bags", "Trendy Footwear"],
        link: "/products",
    },
    {
        icon: Building2,
        name: "Corporate & Workwear",
        description: "Professional and polished fashion for the modern workplace.",
        features: ["Formal Wear", "Structured Bags", "Classic Accessories"],
        link: "/products",
    },
    {
        icon: Church,
        name: "Traditional & Cultural",
        description: "Ethnic and cultural fashion for festivals, poojas, and ceremonies.",
        features: ["Ethnic Collections", "Traditional Accessories", "Festive Wear"],
        link: "/products",
    },
    {
        icon: School,
        name: "College & Campus",
        description: "Youthful and trendy fashion for students and young professionals.",
        features: ["Casual Wear", "Backpacks", "Street Style"],
        link: "/products",
    },
    {
        icon: Truck,
        name: "Travel & Lifestyle",
        description: "Durable and stylish fashion for travelers and on-the-go lifestyles.",
        features: ["Travel Bags", "Comfortable Footwear", "Utility Accessories"],
        link: "/products",
    },
];

export default function IndustriesPage() {
    return (
        <div className="bg-page min-h-screen">
            <PageHero
                title="Industries We Serve"
                description="Professional fashion solutions tailored for your specific needs"
                breadcrumbs={[{ label: "Industries" }]}
                variant="default"
                size="md"
            />

            {/* Industries Grid */}
            <section className="bg-section-white section-padding">
                <div className="section-container">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {industries.map((industry, index) => (
                            <Link
                                key={index}
                                href={industry.link}
                                className="group bg-white border-2 border-border rounded-2xl p-8 hover:border-primary hover:shadow-xl transition-all"
                            >
                                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                                    <industry.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="font-display   text-xl text-foreground mb-3">
                                    {industry.name}
                                </h3>
                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    {industry.description}
                                </p>
                                <div className="space-y-2 mb-6">
                                    {industry.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                                    Shop Products
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-muted/30 section-padding">
                <div className="section-container">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="font-display text-3xl   text-foreground mb-4">
                            Need Help Choosing?
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            Our fashion experts can recommend the perfect outfit or accessory for your specific occasion and budget.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/contact">
                                <Button size="lg" className="rounded-full px-8">
                                    Get Expert Advice
                                </Button>
                            </Link>
                            <Link href="/products">
                                <Button variant="outline" size="lg" className="rounded-full px-8">
                                    Browse All Products
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
