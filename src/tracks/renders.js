/*  Interface open to renderers
 */
import bigWig from "./bigwig"
import hic from "./hic"

import bigBed from "./bigbed"
import bigBedLarge from "./bigbedLarge"
import binindex from "./binindex"
import tmpl from "./template"
import tabix from "./tabix"
export default {
  "hic": hic,
  "bigwig": bigWig,
  "bigbed": bigBed,
  "bigbedLarge": bigBedLarge,
  "binindex": binindex,
  "img": binindex,
  "tmpl" : tmpl,
  "tabix":tabix,
}
