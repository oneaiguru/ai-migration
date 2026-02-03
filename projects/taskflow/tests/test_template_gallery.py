import json
from template_gallery import Template, TemplateGallery


def test_template_preview_empty_prompt():
    tpl = Template(name="x", display_name="X", description="", prompt="")
    assert tpl.preview() == ""


def test_template_gallery_load_and_preview(tmp_path):
    data = {
        "t1": {
            "display_name": "T1",
            "description": "",
            "prompt": "Line1\nLine2",
        },
        "t2": {
            "display_name": "T2",
            "description": "",
            "prompt": "",
        },
    }
    file_path = tmp_path / "gallery.json"
    file_path.write_text(json.dumps(data))

    gallery = TemplateGallery(str(file_path))
    assert len(gallery.templates) == 2
    assert gallery.get("t1").preview() == "Line1"
    assert gallery.get("t2").preview() == ""


def test_template_gallery_init_creates_file(tmp_path):
    file_path = tmp_path / "new_gallery.json"
    assert not file_path.exists()
    gallery = TemplateGallery(str(file_path))
    assert file_path.exists()
    assert gallery.templates == {}
    assert json.loads(file_path.read_text()) == {}
