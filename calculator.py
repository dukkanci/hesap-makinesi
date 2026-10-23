import tkinter as tk
from tkinter import messagebox

class Calculator:
    def __init__(self, root):
        self.root = root
        self.root.title("Hesap Makinesi")
        self.root.geometry("300x400")
        self.root.resizable(False, False)

        self.expression = ""
        self.display_var = tk.StringVar()
        self.display_var.set("0")

        self.create_widgets()

    def create_widgets(self):
        # Ekran
        display = tk.Entry(
            self.root,
            textvariable=self.display_var,
            font=("Arial", 24),
            justify="right",
            bd=10,
            relief="sunken"
        )
        display.grid(row=0, column=0, columnspan=4, sticky="nsew", padx=5, pady=5)

        # Butonlar
        buttons = [
            ("C", 1, 0), ("⌫", 1, 1), ("%", 1, 2), ("/", 1, 3),
            ("7", 2, 0), ("8", 2, 1), ("9", 2, 2), ("*", 2, 3),
            ("4", 3, 0), ("5", 3, 1), ("6", 3, 2), ("-", 3, 3),
            ("1", 4, 0), ("2", 4, 1), ("3", 4, 2), ("+", 4, 3),
            ("±", 5, 0), ("0", 5, 1), (".", 5, 2), ("=", 5, 3),
        ]

        for (text, row, col) in buttons:
            btn = tk.Button(
                self.root,
                text=text,
                font=("Arial", 18),
                command=lambda t=text: self.on_click(t),
                bg="#f0f0f0" if text not in "=C⌫" else ("#4CAF50" if text == "=" else "#f44336"),
                fg="white" if text in "=C⌫" else "black",
                activebackground="#ddd"
            )
            btn.grid(row=row, column=col, sticky="nsew", padx=2, pady=2)

        # Grid ağırlıkları
        for i in range(6):
            self.root.rowconfigure(i, weight=1)
        for i in range(4):
            self.root.columnconfigure(i, weight=1)

    def on_click(self, char):
        if char == "C":
            self.expression = ""
            self.display_var.set("0")
        elif char == "⌫":
            self.expression = self.expression[:-1]
            self.display_var.set(self.expression if self.expression else "0")
        elif char == "=":
            self.calculate()
        elif char == "±":
            self.negate()
        elif char == "%":
            self.percent()
        else:
            self.expression += str(char)
            self.display_var.set(self.expression)

    def calculate(self):
        try:
            result = eval(self.expression)
            self.display_var.set(str(result))
            self.expression = str(result)
        except ZeroDivisionError:
            self.display_var.set("Hata: Sıfıra bölme")
            self.expression = ""
        except Exception:
            self.display_var.set("Hata")
            self.expression = ""

    def negate(self):
        if self.expression and self.expression != "0":
            if self.expression.startswith("-"):
                self.expression = self.expression[1:]
            else:
                self.expression = "-" + self.expression
            self.display_var.set(self.expression)

    def percent(self):
        try:
            result = eval(self.expression) / 100
            self.display_var.set(str(result))
            self.expression = str(result)
        except:
            pass

if __name__ == "__main__":
    root = tk.Tk()
    app = Calculator(root)
    root.mainloop()