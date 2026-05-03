# desktop

![screenshot](assets/desktop.png)

A personal Wayland shell mockup built with [AGS](https://github.com/aylur/ags)
on top of GTK4.  
Used as my daily driver until [arc](https://github.com/Hato1125)
(a future C++ UI framework) is ready.

## Stack

- AGS / gnim (TypeScript JSX → GTK4)
- GJS runtime
- esbuild + lightningcss

## Run

```sh
bun run watch    # watch + reload
bun run debug    # one-off debug build
bun run release  # release build
```
