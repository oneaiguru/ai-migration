from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional, Union, Dict


@dataclass
class Node:
    kind: str
    children: List["Node"] = field(default_factory=list)
    props: Dict[str, Union[str, int, bool, float]] = field(default_factory=dict)
    id: Optional[str] = None
    x: Optional[int] = None
    y: Optional[int] = None
    w: Optional[int] = None
    h: Optional[int] = None
    events: Dict[str, str] = field(default_factory=dict)  # event -> action
    tabindex: Optional[int] = None
    parent: Optional["Node"] = None

    def add(self, child: "Node") -> None:
        child.parent = self
        self.children.append(child)


@dataclass
class Screen(Node):
    name: str = ""

    def __init__(self, name: str):
        super().__init__(kind="screen")
        self.name = name


@dataclass
class Panel(Node):
    name: str = ""
    percent: Optional[int] = None
    orientation: Optional[str] = None  # horizontal/vertical

    def __init__(self, name: str, percent: Optional[int] = None, orientation: Optional[str] = None):
        super().__init__(kind="panel")
        self.name = name
        self.percent = percent
        self.orientation = orientation


@dataclass
class Form(Node):
    name: str = ""

    def __init__(self, name: str):
        super().__init__(kind="form")
        self.name = name


@dataclass
class ListView(Node):
    name: str = ""

    def __init__(self, name: str):
        super().__init__(kind="list")
        self.name = name


@dataclass
class Header(Node):
    text: str = ""

    def __init__(self, text: str):
        super().__init__(kind="header")
        self.text = text


@dataclass
class Text(Node):
    text: str = ""

    def __init__(self, text: str):
        super().__init__(kind="text")
        self.text = text


@dataclass
class Button(Node):
    label: str = ""
    disabled: bool = False

    def __init__(self, label: str, disabled: bool = False):
        super().__init__(kind="button")
        self.label = label
        self.disabled = disabled


@dataclass
class Link(Node):
    label: str = ""
    href: Optional[str] = None

    def __init__(self, label: str, href: Optional[str] = None):
        super().__init__(kind="link")
        self.label = label
        self.href = href


@dataclass
class Input(Node):
    name: Optional[str] = None
    value: Optional[str] = None
    placeholder: Optional[str] = None

    def __init__(self, name: Optional[str] = None, value: Optional[str] = None, placeholder: Optional[str] = None):
        super().__init__(kind="input")
        self.name = name
        self.value = value
        self.placeholder = placeholder


@dataclass
class Checkbox(Node):
    label: str = ""
    checked: bool = False

    def __init__(self, label: str, checked: bool = False):
        super().__init__(kind="checkbox")
        self.label = label
        self.checked = checked


UIRoot = Screen


@dataclass
class Split(Node):
    orientation: str = "horizontal"  # or "vertical"

    def __init__(self, orientation: str):
        super().__init__(kind="split")
        self.orientation = orientation


@dataclass
class Grid(Node):
    columns: int = 2

    def __init__(self, columns: int = 2):
        super().__init__(kind="grid")
        self.columns = max(1, int(columns))


@dataclass
class Image(Node):
    src: str = ""
    width: Optional[int] = None
    height: Optional[int] = None

    def __init__(self, src: str, width: Optional[int] = None, height: Optional[int] = None):
        super().__init__(kind="image")
        self.src = src
        self.width = width
        self.height = height


@dataclass
class Progress(Node):
    label: str = ""
    value: int = 0
    max: int = 100

    def __init__(self, label: str, value: int = 0, max_value: int = 100):
        super().__init__(kind="progress")
        self.label = label
        self.value = value
        self.max = max_value


@dataclass
class RadioGroup(Node):
    name: str = ""

    def __init__(self, name: str):
        super().__init__(kind="radiogroup")
        self.name = name


@dataclass
class RadioOption(Node):
    label: str = ""
    selected: bool = False

    def __init__(self, label: str, selected: bool = False):
        super().__init__(kind="radio")
        self.label = label
        self.selected = selected
