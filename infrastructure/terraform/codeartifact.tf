resource "aws_codeartifact_domain" "luxlife" {
  domain = "luxlife"
}

resource "aws_codeartifact_repository" "packages" {
  repository = "packages"
  domain     = aws_codeartifact_domain.luxlife.domain

  external_connections {
    external_connection_name = "public:maven-central"
  }
}
