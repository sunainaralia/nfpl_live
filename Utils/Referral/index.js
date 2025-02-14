import collections from "../Collections/collections.js";
export function generatereferalId() {
  const generateRandomNumber = () => Math.floor(Math.random() * 10); // Random digit 0-9
  const generateRandomAlpha = () => String.fromCharCode(Math.floor(Math.random() * 26) + 65); // Random alphabet A-Z

  // Generate the referral key with 3 digits and 3 alphabets
  let key = `${generateRandomAlpha()}${generateRandomNumber()}${generateRandomNumber()}${generateRandomNumber()}${generateRandomAlpha()}${generateRandomAlpha()}`;
  return key;
}

export default async function isreferalIdUnique(referralKey) {
  const existingUser = await collections.userCollection().findOne({ referalId: referralKey });
  return !existingUser; // Return true if the key is unique (does not exist)
}