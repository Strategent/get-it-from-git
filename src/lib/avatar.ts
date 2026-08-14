const senderImages: Record<string, string> = {
  "John Harwick": "/john-harwick.webp",
  "Elena Smith": "/email-elena-smith.webp",
  "Emma Reeves": "/email-emma-reeves.webp",
  "Adrian Engman": "/email-adrian-engman.webp",
  "Claire Bennett": "/email-claire-bennett.webp",
  "Daniel Brooks": "/email-daniel-brooks.webp",
  "Lena Foster": "/email-lena-foster.webp",
  "Maya Lopez": "/email-maya-lopez.webp",
  "Nina Mercer": "/email-nina-mercer.webp",
  Stripe: "/email-stripe-logo.webp",
};

// Only the provided WebP assets are ever used. Unknown names map
// deterministically into this same pool so a given name always keeps the
// same face across every page (inbox, team, channels, calendar, tasks).
const photoPool = [
  "/email-elena-smith.webp",
  "/email-emma-reeves.webp",
  "/email-adrian-engman.webp",
  "/email-claire-bennett.webp",
  "/email-daniel-brooks.webp",
  "/email-lena-foster.webp",
  "/email-maya-lopez.webp",
  "/email-nina-mercer.webp",
];


const senderEmails: Record<string, string> = {
  "Elena Smith": "elena.smith@harwicksterne.com",
  "Emma Reeves": "emma.reeves@hartleytrust.com",
  "Adrian Engman": "adrian@sterlingholdings.com",
  "Claire Bennett": "claire@caldwellestate.com",
  "Daniel Brooks": "daniel@marlowcap.com",
  "Lena Foster": "lena@beaumontgroup.com",
  "Maya Lopez": "maya@castellanosholdings.com",
  "Nina Mercer": "nina@merceradvisory.com",
  Stripe: "notifications@stripe.com",
};

/**
 * Always resolves to one of the provided PNG assets — never an external avatar.
 */
export function avatarUrl(name: string, _size = 96): string {
  const mappedImage = senderImages[name];
  if (mappedImage) return mappedImage;

  const seed = name.trim().toLowerCase().replace(/\s+/g, "-");
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return photoPool[hash % photoPool.length];
}


export function senderEmailAddress(name: string): string {
  return senderEmails[name] ?? `${name.toLowerCase().split(" ").join(".")}@harwicksterne.com`;
}