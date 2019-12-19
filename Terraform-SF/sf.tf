provider "aws"{
    region = "us-east-2"
    access_key="AKIAIYIL73YJMO4SEZ5A"
    secret_key = "ktzLvCQcQOLGv+Gxfdmbs5X0uDHNwcanlYojOzI7"

}

resource "aws_instance" "example_public" {
  ami                    = "ami-0bca5a5201bf1ba93"
  instance_type          = "t2.micro"
  vpc_security_group_ids = ["${aws_security_group.example.id}"]
  key_name               = "ServerSpalla"
  associate_public_ip_address = true

  connection {
    type = "ssh"
    host = "${aws_instance.example_public.public_ip}"
    user = "ec2-user"
    port = "22"
    agent = false
    private_key = "${file("ServerSpalla.pem")}"

  }

  provisioner "remote-exec" {
    inline = [
      "cd SF-Academy-ICO;sudo pm2 start npm --name 'react' -- start"
    ]
  }
}

resource "aws_security_group" "example" {
  name = "example"

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port = "22"
    to_port   = "22"
    protocol  = "tcp"

    cidr_blocks = ["0.0.0.0/0"]
  }
}
