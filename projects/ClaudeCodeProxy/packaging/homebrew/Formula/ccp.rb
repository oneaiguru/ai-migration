# NOTE: Sample formula for private tap usage only. Do NOT publish publicly while the project remains in stealth.
class Ccp < Formula
  desc "Claude Code Proxy (private build)"
  homepage "https://example.invalid"
  version "0.1.0"
  url "file://PLACEHOLDER/ccp-0.1.0.tar.gz"
  sha256 "REPLACE_WITH_SHA256"
  license "Proprietary"

  def install
    bin.install "ccp"
  end
end
