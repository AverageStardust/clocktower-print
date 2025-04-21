version=v0.2
deno compile --allow-read --allow-write --target x86_64-pc-windows-msvc --output dist/clocktower-print-$version-windows-x86 ./src/main.ts
deno compile --allow-read --allow-write --target x86_64-apple-darwin --output dist/clocktower-print-$version-macos-x86 ./src/main.ts
deno compile --allow-read --allow-write --target aarch64-apple-darwin --output dist/clocktower-print-$version-macos-arm ./src/main.ts
deno compile --allow-read --allow-write --target x86_64-unknown-linux-gnu --output dist/clocktower-print-$version-linux-x86 ./src/main.ts
deno compile --allow-read --allow-write --target aarch64-unknown-linux-gnu --output dist/clocktower-print-$version-linux-arm ./src/main.ts