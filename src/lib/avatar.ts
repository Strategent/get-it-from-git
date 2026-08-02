const senderImages: Record<string, string> = {
  "John Harwick": "/john-harwick.png",
  "Elena Smith": "/email-elena-smith.png",
  "Emma Reeves": "/email-emma-reeves.png",
  "Adrian Engman": "/email-adrian-engman.png",
  "Claire Bennett": "/email-claire-bennett.png",
  "Daniel Brooks": "/email-daniel-brooks.png",
  "Lena Foster": "/email-lena-foster.png",
  "Maya Lopez": "/email-maya-lopez.png",
  "Nina Mercer": "/email-nina-mercer.png",
  Stripe: "/email-stripe-logo.png",
};

// Only the provided PNG assets are ever used. Unknown names map
// deterministically into this same pool so a given name always keeps the
// same face across every page (inbox, team, channels, calendar, tasks).
const photoPool = [
  "/email-elena-smith.png",
  "/email-emma-reeves.png",
  "/email-adrian-engman.png",
  "/email-claire-bennett.png",
  "/email-daniel-brooks.png",
  "/email-lena-foster.png",
  "/email-maya-lopez.png",
  "/email-nina-mercer.png",
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