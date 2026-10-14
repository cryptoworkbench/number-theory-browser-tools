#!/usr/bin/env bash
# Mode matrix: user agent x query -> the root element's mobile/desktop class.
set -u
ROOT=$(git rev-parse --show-toplevel)
U="file://$ROOT/Cyclic%20Groups/cyclic-groups.html"
IPHONE='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
ANDROID='Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'
TABLET='Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
DESKTOP='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'

htmltag() { # ua query
  local p; p=$(mktemp -d)
  google-chrome --headless --disable-gpu --no-first-run --user-data-dir="$p" \
    --window-size=390,900 --user-agent="$1" --virtual-time-budget=3000 \
    --dump-dom "$U$2" 2>/dev/null | grep -o '<html[^>]*>' | head -1
  rm -rf "$p"
}

fail=0
check() { # name ua query expect(mobile|desktop|neither) [extra-substring]
  local tag cls m=0 d=0 got
  tag=$(htmltag "$2" "$3")
  cls=$(printf '%s' "$tag" | grep -o 'class="[^"]*"')
  case " $cls" in *[\ \"]is-mobile[\ \"]*) m=1;; esac
  case " $cls" in *[\ \"]is-desktop[\ \"]*) d=1;; esac
  if [ $m = 1 ] && [ $d = 0 ]; then got=mobile
  elif [ $m = 0 ] && [ $d = 1 ]; then got=desktop
  elif [ $m = 0 ] && [ $d = 0 ]; then got=neither
  else got=both; fi
  if [ "$got" = "$4" ] && { [ -z "${5:-}" ] || printf '%s' "$tag" | grep -q "$5"; }; then
    echo "PASS $1"
  else
    echo "FAIL $1 (expected $4${5:+ + $5}, got $got) $tag"; fail=1
  fi
}

check "iphone"                 "$IPHONE"  ''            mobile
check "android-phone"          "$ANDROID" ''            mobile
check "android-tablet"         "$TABLET"  ''            desktop
check "desktop"                "$DESKTOP" ''            desktop
check "desktop ?mobile=1"      "$DESKTOP" '?mobile=1'   mobile
check "iphone ?mobile=0"       "$IPHONE"  '?mobile=0'   desktop
check "iphone ?preview=1"      "$IPHONE"  '?preview=1'  neither
check "iphone ?ringwin=1"      "$IPHONE"  '?ringwin=1'  neither
check "iphone ?lang=ar"        "$IPHONE"  '?lang=ar'    mobile 'dir="rtl"'
exit $fail
