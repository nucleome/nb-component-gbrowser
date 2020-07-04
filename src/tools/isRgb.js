export default function(s) {
  if (s == "0" || s == "0,0,0") {
    return true
  } else if (s.match(/\d+,\d+,\d+/)){
    return true
  }
  return false
}
