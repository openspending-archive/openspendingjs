watch ( 'app/(.*)\.coffee' ) { |md| system("./build.sh; ") }
watch ( 'app/(.*)\.js' ) { |md| system("./build.sh; ") }
watch ( 'widgets/(.*)\.js' ) { |md| system("./build.sh; ") }
watch ( 'lib/(.*)\.js' ) { |md| system("./build.sh; ") }
