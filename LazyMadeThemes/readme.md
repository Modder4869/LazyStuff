# Null - Theme [Dark]
Customizable default discord theme ***Not User Friendly*** 

`Download it , Copy it to themes folder , Reload Discord (Ctrl +R), Enable it`
**Edit the vars in theme fille or copy one of the example to custom css and click save then update** 

 `Ctrl` + `Shift` + `I` then click on `<html`
and change values then copy it to custom css

Like This

![https://i.imgur.com/Dt6dWV9.gif](https://i.imgur.com/Dt6dWV9.gif)
```css
--hue: (1) + (50);
```

means  that original hue value will be mutiplied by 1 and get 0 added to it
so if it is 50 then final result is for hue in hsla will be 100 , which is kinda wrong but whatever

# Some examples (ignore the names)
# BlueAndWhite
```css
:root {
    --hue: (1) + (380);
    --saturation: (1) + (-102%);
    --lightness: (1) + (-12%);
    --alpha: (1) + (0);
    --text-color: hsl(216, 76%, 57%);
    --selection-color: white;
}
```
![Imgur](https://i.imgur.com/Vmeuf2s.png)
# Default

```css
:root {
        --hue: (1) + (0);
        --saturation: (1) + (0%);
        --lightness: (1) + (0%); 
        --alpha: 1 ; 
        --text-color: hsl(218, 5%, 47%);
    }
```
# Dark

```css
:root {

    --hue: (1) + (380);
    --saturation: (1) + (-102%);
    --lightness: (1) + (-6%);
    --alpha: (1) + (-0.3);
    --text-color: hsl(343, 38%, 40%);
} 
```
![Imgur](https://i.imgur.com/wiLwEhp.png)
# Purple 

```css
:root {
    --hue: (0) + (-59.2);
    --saturation: (1) + (38%);
    --lightness: (1) + (-13.5%);
    --alpha: (1) + (0);
    --text-color: hsl(292, 15%, 37%);
    --selection-color: hsl(292, 15%, 37%);
}
```
![Imgur](https://i.imgur.com/Sv8Q1IS.png)
# Green

```css
:root {
    --hue: (1) + (380);
    --saturation: (1) + (0%);
    --lightness: (1) + (-6%);
    --alpha: (1) + (0);
    --text-color: hsl(109, 38%, 40%);
    --selection-color: hsl(109, 38%, 40%);
}
```
![Imgur](https://i.imgur.com/nIyJ7Tq.png)
# Blue

```css
:root {
    --hue: (1) + (25555);
    --saturation: (1) + (44%);
    --lightness: (1) + (17%);
    --alpha: (1) + (-0);
    --text-color: hsl(207, 143%, 36%);
    --selection-color: hsl(207, 143%, 36%);
}
```
![Imgur](https://i.imgur.com/EEGcglI.png)
# Another Dark 

```css
:root {
      --hue: 0 + -134;
    --saturation: 1 + -840%;
    --lightness: 1 + -9%;
    --alpha: 1 + 0;
    --text-color: #3e3c3e;
    --selection-color: #3e3c3e;
    }
```
![Imgur](https://i.imgur.com/8BgpzK3.png)

# Background *just testing*
```css
:root{
    --hue: (1) + (85);
    --saturation: (1) + (1%);
    --lightness: (1) + (-13%);
    --alpha: (1) + (0);
    --text-color: #8d1b46; /*text and accent color probably */
    --selection-color: #EDE7F6; /*channel names mostly*/
   --blurVal:0px; /*blur value , px is required */
   --withBg: url("https://orig00.deviantart.net/b866/f/2016/197/1/9/megumin_wallpaper_by_kaazuma-daa79g7.png") 
/* ^ credits */
--opVal:0.8; /* opacity value 0-1 */
}
body::before {
  z-index:-1;
  content: " ";
  width: 100%;
  height: 100%;
  background-size: cover;
  position: absolute;
  background: var(--withBg) no-repeat center center fixed;
  filter: blur(var(--blurVal));
}
#app-mount{
    opacity:var(--opVal);
} 

```
![Imgur](https://i.imgur.com/AdOXZKo.png)

# Blurred Background *just testing*
```css
:root{
    --hue: (1) + (85);
    --saturation: (1) + (1%);
    --lightness: (1) + (-13%);
    --alpha: (1) + (0);
    --text-color: #8d1b46; /*text and accent color probably */
    --selection-color: #EDE7F6; /*channel names mostly*/
   --blurVal:5px; /*blur value , px is required */
   --withBg: url("https://orig00.deviantart.net/b866/f/2016/197/1/9/megumin_wallpaper_by_kaazuma-daa79g7.png");
/* ^ credits */
--opVal:0.8; /* opacity value 0-1 */
}
body::before {
  z-index:-1;
  content: " ";
  width: 100%;
  height: 100%;
  background-size: cover;
  position: absolute;
  background: var(--withBg) no-repeat center center fixed;
  filter: blur(var(--blurVal));
}
#app-mount{
    opacity:var(--opVal);
} 

```
![Imgur](https://i.imgur.com/GVDe1d0.png)
