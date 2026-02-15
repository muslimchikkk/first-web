import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCATIONS_PATH = path.join(__dirname, "locations.config.json");
const OUTPUT_PATH = path.join(
  __dirname,
  "..",
  "assets",
  "data",
  "places-snapshot.json"
);

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!API_KEY) {
  console.error("Missing GOOGLE_PLACES_API_KEY environment variable.");
  process.exit(1);
}

const requestDelay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const toReviewItem = (review) => ({
  author_name: review.author_name || "Guest",
  author_url: review.author_url || "",
  profile_photo_url: review.profile_photo_url || "",
  rating: Number(review.rating) || 0,
  text: String(review.text || "").trim(),
  time: Number(review.time) || 0,
});

const pickTopReviews = (reviews) => {
  const normalized = reviews
    .map(toReviewItem)
    .filter((item) => item.rating > 0 && item.text);
  const high = normalized.filter((item) => item.rating >= 4);
  const mid = normalized.filter((item) => item.rating === 3);
  const selected = high.slice(0, 5);
  if (selected.length < 5) {
    selected.push(...mid.slice(0, 5 - selected.length));
  }
  return selected;
};

const fetchPlaceDetails = async (location) => {
  const endpoint = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json"
  );
  endpoint.searchParams.set("place_id", location.placeId);
  endpoint.searchParams.set(
    "fields",
    [
      "name",
      "rating",
      "user_ratings_total",
      "formatted_address",
      "formatted_phone_number",
      "url",
      "reviews",
    ].join(",")
  );
  endpoint.searchParams.set("reviews_sort", "newest");
  endpoint.searchParams.set("key", API_KEY);

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`${location.name}: HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (payload.status !== "OK" || !payload.result) {
    throw new Error(
      `${location.name}: Places API status ${payload.status} (${payload.error_message || "no details"})`
    );
  }

  const result = payload.result;
  return {
    name: result.name || location.name,
    placeId: location.placeId,
    url: result.url || location.url || "",
    position: location.position || null,
    rating: Number(result.rating) || null,
    user_ratings_total: Number(result.user_ratings_total) || 0,
    formatted_address: result.formatted_address || "",
    formatted_phone_number: result.formatted_phone_number || "",
    reviews: pickTopReviews(Array.isArray(result.reviews) ? result.reviews : []),
  };
};

const run = async () => {
  const rawLocations = await readFile(LOCATIONS_PATH, "utf8");
  const locations = JSON.parse(rawLocations);

  if (!Array.isArray(locations) || locations.length === 0) {
    throw new Error("locations.config.json is empty or invalid.");
  }

  const outputLocations = [];
  for (const location of locations) {
    const details = await fetchPlaceDetails(location);
    outputLocations.push(details);
    await requestDelay(120);
    console.log(
      `Fetched ${details.name}: ${details.rating ?? "-"} (${details.user_ratings_total ?? 0})`
    );
  }

  const snapshot = {
    generatedAt: new Date().toISOString(),
    refreshIntervalDays: 7,
    locations: outputLocations,
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  console.log(`Snapshot saved to ${OUTPUT_PATH}`);
  console.log("Next recommended refresh: 7 days.");
};

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
