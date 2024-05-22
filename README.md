# Icon Optimizer and Converter.

## Usage

Place the icons in the input folder and run the script.<br>
By default it will use ./input as the input folder and ./output as the output folder.

It will detect duplicate names and will prefix the icon with the folder name it's in.
It will will show you the icons that have been renamed.

When you generate a sprite it will give you an example of how to use it in your html file.


```txt
--help -h         - Display the help.
--version -v      - Display the version.

--input         - Input folder of the icons.
--output        - Output folder of the icons.

--icons         - Generate the icons.
--sprite        - Generate a sprite.	
--optimize      - Optimize the icons using my defaults.

--id            - Add an id attribute to the icons.
--remove-style  - Remove the style attribute from the icons.
--remove-size   - Remove the size attribute from the icons.

--stroke-width  - Stroke width of the icons.
--colors        - Change the colors of the icons, you have enable this flag to use the --fill and --stroke flag.
--fill          - Fill color of the icons.
--stroke        - Stroke color of the icons.
```

## Examples

```cmd
node ./iconConverter.js --optimize --icons --sprite
```

```cmd
node ./iconConverter.js --sprite --icons --colors --fill currentColor --stroke currentColor --remove-style --id --remove-size --stroke-width 2
```


#### Todo:
```txt
--svg           - Generate svg files.
--png           - Generate png files.
--webp          - Generate webp files.
--jpg           - Generate jpg files.
--avif          - Generate avif files.
--ico           - Generate ico files.
```