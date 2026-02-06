from pathlib import Path
import tempfile

def test_create_demo_bundle():
    from scripts.create_demo_bundle import create_demo_bundle

    with tempfile.TemporaryDirectory() as tmpdir:
        bundle_dir = create_demo_bundle(Path(tmpdir))

        assert (bundle_dir / 'sites_service_demo.csv').exists()
        assert (bundle_dir / 'sites_registry_demo.csv').exists()
        assert (bundle_dir / 'README.md').exists()
