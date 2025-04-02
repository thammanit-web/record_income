"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserTabsProps {
  selectedUser: string
  onUserChange: (userId: string) => void
}

export function UserTabs({ selectedUser, onUserChange }: UserTabsProps) {
  return (

      <Tabs value={selectedUser} onValueChange={onUserChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="ray"
            className="flex items-center justify-center gap-2 "
            data-state={selectedUser === "ray" ? "active" : "inactive"}
          >
            <Avatar data-state="active" className="h-8 w-8">
              <AvatarImage src="/cute_girl.png" alt="Ray" />
              <AvatarFallback>R</AvatarFallback>
            </Avatar>

            <span className="font-medium">น้องเรย์</span>
          </TabsTrigger>
          <TabsTrigger
            value="bon"
            className="flex items-center justify-center gap-2"
            data-state={selectedUser === "bon" ? "active" : "inactive"}
          >
            <Avatar className="h-8 w-8 border-2 border-transparent data-[state=active]:border-primary">
              <AvatarImage src="/bad_boy.jpg" alt="Bon" />
              <AvatarFallback>B</AvatarFallback>
            </Avatar>
            <span className="font-medium">นายอัครเดชสุขสมพร</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

  )
}

