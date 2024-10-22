import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MenuAvatarProps {
  name: string;
  picture: string | null;
}

export const MenuAvatar = ({ name, picture }: MenuAvatarProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <Avatar className="h-8 w-8 rounded-lg">
      {picture ? (
        <AvatarImage referrerPolicy={"no-referrer"} src={picture} alt={name} />
      ) : (
        <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
      )}
    </Avatar>
  );
};
