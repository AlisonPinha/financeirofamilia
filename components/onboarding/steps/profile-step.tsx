"use client"

import { useState } from "react"
import { User, Mail, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ProfileData {
  nome: string
  email: string
  avatar: string
}

interface ProfileStepProps {
  data: ProfileData
  onChange: (data: ProfileData) => void
  errors?: Record<string, string>
}

// Avatar seeds para DiceBear
const avatarSeeds = [
  "Felix", "Aneka", "Luna", "Max", "Bella",
  "Leo", "Sofia", "Oliver", "Emma", "Jack",
  "Mia", "Charlie", "Lily", "Oscar", "Chloe",
  "Alfie"
]

export function ProfileStep({ data, onChange, errors }: ProfileStepProps) {
  const [selectedSeed, setSelectedSeed] = useState(
    data.avatar ? extractSeedFromUrl(data.avatar) : ""
  )

  function extractSeedFromUrl(url: string): string {
    const match = url.match(/seed=([^&]+)/)
    return match?.[1] ?? ""
  }

  function handleAvatarSelect(seed: string) {
    setSelectedSeed(seed)
    onChange({
      ...data,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Vamos começar!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Conte-nos um pouco sobre você
        </p>
      </div>

      {/* Avatar Selection */}
      <div className="space-y-3">
        <Label>Escolha seu avatar</Label>
        <div className="grid grid-cols-8 gap-2">
          {avatarSeeds.map((seed) => (
            <button
              key={seed}
              type="button"
              onClick={() => handleAvatarSelect(seed)}
              className={cn(
                "relative rounded-full p-0.5 transition-all",
                selectedSeed === seed
                  ? "ring-2 ring-primary ring-offset-2"
                  : "hover:ring-2 hover:ring-muted-foreground/20"
              )}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                  alt={seed}
                />
                <AvatarFallback>{seed[0]}</AvatarFallback>
              </Avatar>
              {selectedSeed === seed && (
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="nome">Nome *</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="nome"
            value={data.nome}
            onChange={(e) => onChange({ ...data, nome: e.target.value })}
            placeholder="Seu nome"
            className={cn("pl-10", errors?.nome && "border-destructive")}
          />
        </div>
        {errors?.nome && (
          <p className="text-sm text-destructive">{errors.nome}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            placeholder="seu@email.com"
            className={cn("pl-10", errors?.email && "border-destructive")}
          />
        </div>
        {errors?.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>
    </div>
  )
}
