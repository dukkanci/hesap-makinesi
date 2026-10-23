from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.gridlayout import GridLayout
from kivy.uix.button import Button
from kivy.uix.textinput import TextInput
from kivy.core.window import Window
from kivy.utils import platform

if platform == 'android':
    from android.permissions import request_permissions, Permission
    request_permissions([Permission.INTERNET])

Window.size = (360, 640)

class CalculatorApp(App):
    def build(self):
        self.expression = ""

        root = BoxLayout(orientation='vertical', padding=10, spacing=10)

        # Display
        self.display = TextInput(
            text="0",
            font_size=48,
            readonly=True,
            halign='right',
            multiline=False,
            background_color=(0.1, 0.1, 0.1, 1),
            foreground_color=(1, 1, 1, 1),
            size_hint_y=0.3,
            padding=(20, 20)
        )
        root.add_widget(self.display)

        # Buttons
        btn_layout = GridLayout(cols=4, spacing=8, size_hint_y=0.7)

        buttons = [
            ('C', 1, 0, (0.9, 0.3, 0.3, 1)), ('⌫', 1, 1, (0.9, 0.5, 0.3, 1)),
            ('%', 1, 2, (0.3, 0.6, 0.9, 1)), ('/', 1, 3, (0.3, 0.6, 0.9, 1)),
            ('7', 2, 0, (0.2, 0.2, 0.2, 1)), ('8', 2, 1, (0.2, 0.2, 0.2, 1)),
            ('9', 2, 2, (0.2, 0.2, 0.2, 1)), ('×', 2, 3, (0.3, 0.6, 0.9, 1)),
            ('4', 3, 0, (0.2, 0.2, 0.2, 1)), ('5', 3, 1, (0.2, 0.2, 0.2, 1)),
            ('6', 3, 2, (0.2, 0.2, 0.2, 1)), ('-', 3, 3, (0.3, 0.6, 0.9, 1)),
            ('1', 4, 0, (0.2, 0.2, 0.2, 1)), ('2', 4, 1, (0.2, 0.2, 0.2, 1)),
            ('3', 4, 2, (0.2, 0.2, 0.2, 1)), ('+', 4, 3, (0.3, 0.6, 0.9, 1)),
            ('±', 5, 0, (0.3, 0.6, 0.9, 1)), ('0', 5, 1, (0.2, 0.2, 0.2, 1)),
            ('.', 5, 2, (0.2, 0.2, 0.2, 1)), ('=', 5, 3, (0.3, 0.7, 0.4, 1)),
        ]

        for (text, row, col, color) in buttons:
            btn = Button(
                text=text,
                font_size=28,
                background_color=color,
                background_normal='',
                color=(1, 1, 1, 1),
                on_press=self.on_button
            )
            btn_layout.add_widget(btn)

        root.add_widget(btn_layout)
        return root

    def on_button(self, instance):
        text = instance.text

        if text == 'C':
            self.expression = ""
            self.display.text = "0"
        elif text == '⌫':
            self.expression = self.expression[:-1]
            self.display.text = self.expression if self.expression else "0"
        elif text == '=':
            self.calculate()
        elif text == '±':
            self.negate()
        elif text == '%':
            self.percent()
        elif text == '×':
            self.expression += '*'
            self.display.text = self.expression
        else:
            self.expression += text
            self.display.text = self.expression

    def calculate(self):
        try:
            result = eval(self.expression)
            if isinstance(result, float) and result.is_integer():
                result = int(result)
            self.display.text = str(result)
            self.expression = str(result)
        except ZeroDivisionError:
            self.display.text = "Hata: Sıfıra bölme"
            self.expression = ""
        except Exception:
            self.display.text = "Hata"
            self.expression = ""

    def negate(self):
        if self.expression and self.expression != "0":
            if self.expression.startswith('-'):
                self.expression = self.expression[1:]
            else:
                self.expression = '-' + self.expression
            self.display.text = self.expression

    def percent(self):
        try:
            result = eval(self.expression) / 100
            self.display.text = str(result)
            self.expression = str(result)
        except:
            pass

if __name__ == '__main__':
    CalculatorApp().run()