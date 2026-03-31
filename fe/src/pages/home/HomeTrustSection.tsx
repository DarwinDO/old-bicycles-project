import { TRUST_FEATURES } from './home.constants'

export function HomeTrustSection() {
  return (
    <section className="border-b bg-muted/40 py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3">
          {TRUST_FEATURES.map((feature) => (
            <div key={feature.title} className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
