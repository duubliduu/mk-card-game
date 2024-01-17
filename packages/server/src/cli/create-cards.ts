import { buildDeck } from "../utils/generateDeck";
import * as fs from "fs";

try {
  fs.writeFileSync("cards.json", JSON.stringify(buildDeck()));
  console.log("file was written");
} catch (e) {
  console.log("could not write file");
}
